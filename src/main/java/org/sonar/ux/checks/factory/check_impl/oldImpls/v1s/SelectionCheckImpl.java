package org.sonar.ux.checks.factory.check_impl.oldImpls.v1s;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.selection.SelectionCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;

public class SelectionCheckImpl extends SelectionCheck 
{
	private boolean hasMultiple = true;
	private boolean hasSingle = true; 
	private boolean hasCheckBoxes = true;
	
	@Override
	public void visitScript(ScriptTree tree)
	{
		if(qualityExpected(tree) && !(qualityPresent(tree)))
		{	
			if(!(hasMultiple))
			{
				addIssue(tree, getCheckMessages()[0]);
			}
			
			if(!(hasSingle))
			{
				addIssue(tree, getCheckMessages()[1]);
			}
			
			if(!(hasCheckBoxes))
			{
				addIssue(tree, getCheckMessages()[2]);
			}
		}
		
		super.visitScript(tree);
	}
	

	@Override
	public boolean qualityExpected(Tree tree) 
	{
		Check tableCheck = UXCheckFactory.getInstance(TableCheck.class);
		List<Issue> tableScan = tableCheck.scanFile(this.getContext());
		boolean table = false;
		if(!tableScan.isEmpty())
		{
			PreciseIssue issue = (PreciseIssue)tableScan.get(0);
			table = issue.primaryLocation().message().equals(tableCheck.getCheckMessages()[2]);
		}
		return table;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		boolean hasQuality = true;
		
		hasMultiple = treeContainsProperty(tree, "multiselect : true");
		hasQuality = hasMultiple;
		
		hasSingle = treeContainsProperty(tree, "selectableRows : true");
		hasQuality = hasQuality && hasSingle;

		hasCheckBoxes = treeContainsProperty(tree, "checkboxes : true");
		hasQuality = hasQuality && hasCheckBoxes;
		
		return hasQuality;
	}
	
	private boolean treeContainsProperty(Tree tree, String property)
	{
		String text = tree.toString();
		
		return text.contains(property);
	}
}
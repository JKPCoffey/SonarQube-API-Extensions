package org.sonar.ux.checks.factory.check_impl.oldImpls.v1s;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.table.TableCheck;
import org.sonar.ux.checks.table.tooltips.TooltipsCheck;

import data.checks.Check;
import utilities.StringUtility;

public class TooltipsCheckImpl extends TooltipsCheck 
{
	@Override
	public void visitScript(ScriptTree tree)
	{
		if(qualityExpected(tree) && !(qualityPresent(tree)))
		{
			addIssue(tree, getCheckMessages()[0]);
		}
	}

	@Override
	public boolean qualityExpected(Tree tree) 
	{
		Check tableCheck = UXCheckFactory.getInstance(TableCheck.class);
		List<Issue> tableIssues = tableCheck.scanFile(this.getContext());
		
		boolean table = false;
		if(!(tableIssues.isEmpty()))
		{
			PreciseIssue issue = (PreciseIssue)tableIssues.get(0);
			table = issue.primaryLocation().message().equals(tableCheck.getCheckMessages()[2]);
		}
		
		return table;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		String text = tree.toString();
		String [] expectedTerms = {"Tooltips", "Tool"};
		
		return StringUtility.reverseSearch(text, expectedTerms);
	}
}

package org.sonar.ux.checks.factory.check_impl.table.settings;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.NewExpressionTree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class TableSettingsCheckImplV2 extends TableSettingsCheck 
{
	private Tree issuePoint;
	
	@Override
	public void visitCallExpression(CallExpressionTree tree)
	{
		if(defineMethodCalled(tree))
		{
			ArgumentListTree argueTree = tree.argumentClause();

			if(qualityExpected(tree) && !(qualityPresent(argueTree)))
			{
				addIssue(issuePoint, getCheckMessages()[0]);
			}
		}
		
		super.visitCallExpression(tree);
	}
	
	private boolean defineMethodCalled(CallExpressionTree tree)
	{
		return tree.callee().toString().equals("define");
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
		boolean present;
		
		ArgumentListTree argueTree = (ArgumentListTree)tree;
		issuePoint = argueTree.arguments().get(0);
		present =  ArrayUtility.arrayContainsValue(StringUtility.trimSplit(issuePoint.toString(), ","), "'tablelib/TableSettings'");
		
		if(present)
		{
			List<Tree> constructors = getConstructors(tree);
			present = !(constructors.stream().filter(t -> t.toString().contains("TableSettings")).collect(Collectors.toList()).isEmpty());
		}
		
		return present;
	}
	
	private List<Tree> getConstructors(Tree tree)
	{
		List<Tree> list = new ArrayList<Tree>(0);
		
		if(tree != null)
		{
			if(tree instanceof NewExpressionTree)
			{
				list.add(tree);
			}
			
			else
			{
				try
				{
					tree.childrenStream().forEach(c -> list.addAll(getConstructors(c)));
				}
				
				catch(UnsupportedOperationException e)
				{
					//One or more Trees throws the above exception when calling childrenStream()
					//In those cases, take it as the end of a branch and return nothing
				}
			}
		}
		
		return list;
	}
}

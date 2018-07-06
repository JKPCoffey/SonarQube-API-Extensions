package org.sonar.ux.checks.factory.check_impl.oldImpls.v1s;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class TableSettingsCheckImpl extends TableSettingsCheck 
{
	@Override
	public void visitCallExpression(CallExpressionTree tree)
	{
		if(defineMethodCalled(tree))
		{
			ArgumentListTree argueTree = tree.argumentClause();

			if(qualityExpected(tree) && !(qualityPresent(argueTree)))
			{
				addIssue(argueTree.arguments().get(0), getCheckMessages()[0]);
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
		ArgumentListTree argueTree = (ArgumentListTree)tree;
		return ArrayUtility.arrayContainsValue(StringUtility.trimSplit(argueTree.arguments().get(0).toString(), ","), "'tablelib/TableSettings'");
	}
}

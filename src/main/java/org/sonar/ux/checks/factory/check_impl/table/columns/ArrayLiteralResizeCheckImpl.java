package org.sonar.ux.checks.factory.check_impl.table.columns;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArrayLiteralTree;
import org.sonar.plugins.javascript.api.tree.expression.ExpressionTree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.columns.ArrayLiteralResizeCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class ArrayLiteralResizeCheckImpl extends ArrayLiteralResizeCheck
{
	@Override
	public void visitArrayLiteral(ArrayLiteralTree tree)
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
		
		boolean isTable = false;
		
		if(!(tableIssues.isEmpty()))
		{
			//Code example for examining which issue a check is showing
			PreciseIssue issue = (PreciseIssue)tableIssues.get(0);
			isTable = issue.primaryLocation().message().equals(tableCheck.getCheckMessages()[2]);
		}
		
		return isTable;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		return resizableInTree((ArrayLiteralTree)tree);
	}
	
	private boolean resizableInTree(ArrayLiteralTree tree)
	{
		boolean inTree = false;
		List<ExpressionTree> list = tree.elements();
		
		for(int listIndex = 0; !inTree && listIndex < list.size(); listIndex++)
		{
			String [] attributes = StringUtility.trimSplit(list.get(listIndex).toString(), ",");
			inTree = ArrayUtility.arrayContainsValue(attributes, "resizable : true");
		}
		
		return inTree;
	}
}

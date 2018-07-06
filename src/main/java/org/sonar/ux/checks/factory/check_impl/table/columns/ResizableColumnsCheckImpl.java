package org.sonar.ux.checks.factory.check_impl.table.columns;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.columns.ArrayLiteralResizeCheck;
import org.sonar.ux.checks.table.columns.ResizableColumnsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class ResizableColumnsCheckImpl extends ResizableColumnsCheck 
{
	@Override
	public void visitCallExpression(CallExpressionTree tree)
	{	
		if(defineCalled(tree) && qualityExpected(tree) && !(qualityPresent(tree)))
		{
			addIssue(tree.argumentClause().arguments().get(0), getCheckMessages()[0]);
		}
	
		super.visitCallExpression(tree);
	}	

	private boolean defineCalled(CallExpressionTree tree)
	{
		return tree.callee().toString().equals("define");
	}
	
	@Override
	public boolean qualityExpected(Tree tree) 
	{
		Check tableCheck = UXCheckFactory.getInstance(TableCheck.class);
		List<Issue> tableIssues = tableCheck.scanFile(this.getContext());
		
		boolean isTable = false;
		
		if(!(tableIssues.isEmpty()))
		{
			PreciseIssue issue = (PreciseIssue)tableIssues.get(0);
			
			isTable = issue.primaryLocation().message().equals(tableCheck.getCheckMessages()[2]);
		}

		return isTable;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		ArgumentListTree argueTree = ((CallExpressionTree)tree).argumentClause();
			
		boolean inLiteral 		= UXCheckFactory.getInstance(ArrayLiteralResizeCheck.class).scanFile(this.getContext()).isEmpty();
		boolean inDependencies 	= weHaveResizableColumns(argueTree);
		
		return inLiteral || inDependencies;
	}
	
	private boolean weHaveResizableColumns(ArgumentListTree tree)
	{
		return ArrayUtility.arrayContainsValue(getDependencies(tree), "'tablelib/plugins/ResizableHeader'");
	}
	
	private String [] getDependencies(ArgumentListTree tree)
	{
		return StringUtility.trimSplit(tree.arguments().get(0).toString(), ",");
	}
}

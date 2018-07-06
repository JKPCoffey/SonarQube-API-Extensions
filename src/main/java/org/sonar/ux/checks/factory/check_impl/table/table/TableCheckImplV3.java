package org.sonar.ux.checks.factory.check_impl.table.table;

import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.ux.checks.table.table.TableCheck;

import utilities.ArrayUtility;
import utilities.StringUtility;

public class TableCheckImplV3 extends TableCheck 
{
	@Override
	public void visitCallExpression(CallExpressionTree tree)
	{
		if(defineCall(tree))
		{
			if(qualityExpected(tree))
			{
				if(qualityPresent(tree))
					addIssue(tree, getCheckMessages()[2]);
				
				else
					addIssue(tree, getCheckMessages()[1]);
			}
			
			else
			{
				addIssue(tree, getCheckMessages()[0]);
			}
		}
	}
	
	private boolean defineCall(CallExpressionTree tree)
	{
		return tree.callee().toString().equals("define");
	}
	
	@Override
	public boolean qualityExpected(Tree tree) 
	{
		ArgumentListTree argueTree = ((CallExpressionTree)tree).argumentClause();
		String [] dependencies = getDependencies(argueTree);
		
		boolean expect = false;
		
		for(int depIndex = 0; !expect && depIndex < dependencies.length; depIndex++)
		{
			expect = dependencies[depIndex].contains("tablelib");
		}
		
		return expect;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		ArgumentListTree argueTree = ((CallExpressionTree)tree).argumentClause();
		String [] dependencies = getDependencies(argueTree);
		
		return ArrayUtility.arrayContainsValue(dependencies, "'tablelib/Table'");
	}
	
	private String [] getDependencies(ArgumentListTree tree)
	{
		String dependencies = tree.arguments().get(0).toString();
		return StringUtility.trimSplit(dependencies, ",");
	}
}

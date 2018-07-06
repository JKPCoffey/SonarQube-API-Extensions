package org.sonar.ux.checks.factory.check_impl.oldImpls.v2s;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;

import java.util.List;
import java.util.stream.Collectors;

import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.file.BlankFileCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import utilities.ArrayUtility;
import utilities.StringUtility;

class TableCheckImplV2 extends TableCheck 
{
	@Override
	public void visitScript(ScriptTree tree)
	{ 
		if(qualityExpected(tree))
		{
			List<Tree> trees = tree.descendants().collect(Collectors.toList());
			
			for(Tree tr : trees)
			{
				if(tr instanceof CallExpressionTree)
				{
					CallExpressionTree cTree = ((CallExpressionTree)tr);
					
					if(cTree.callee().toString().equals("define"))
					{
						callExpression(cTree);
					}
				}
			}
		}
		
		super.visitScript(tree);
	}

	private void callExpression(CallExpressionTree tree)
	{	
		ArgumentListTree argueTree = tree.argumentClause();
		
		boolean isTable = qualityPresent(argueTree);
		
		if(!isTable)
		{
			addIssue(argueTree, getCheckMessages()[1]);
		}
		
		else
		{
			boolean tableDep = hasTableDependency(getDependencies(argueTree));
			
			if(!tableDep)
			{
				addIssue(argueTree, getCheckMessages()[0]);
			}
		}
		
	}
	
	@Override
	public boolean qualityExpected(Tree tree) 
	{
		boolean blank = scriptIsBlank((ScriptTree)tree);
		boolean define = tree.toString().contains("define");
		boolean tablelib = tree.toString().contains("tablelib");
		
		if(!blank && define && tablelib)
		{
			addIssue(tree, getCheckMessages()[2]);
		}
		
		return  blank && define && tablelib;
	}

	
	
	private boolean scriptIsBlank(ScriptTree tree)
	{
		boolean isBlank = !(UXCheckFactory.getInstance(BlankFileCheck.class).scanFile(this.getContext()).isEmpty());
		
		if(isBlank)
		{
			addIssue(tree, getCheckMessages()[0]);
		}
		
		return isBlank;
	}
	
	
	@Override
	public boolean qualityPresent(Tree tree) 
	{
		String [] dependencies = getDependencies((ArgumentListTree)tree);
			
		return usesTableLibrary(dependencies);
	}
	
	private String[] getDependencies(ArgumentListTree tree)
	{
		return StringUtility.trimSplit(tree.arguments().get(0).toString(), ",");
	}
	
	private boolean usesTableLibrary(String [] dependencies)
	{
		return ArrayUtility.arrayContainsValue(dependencies, "tablelib");
	}
	
	private boolean hasTableDependency(String[] dependencies)
	{
		return ArrayUtility.arrayContainsValue(dependencies, "tablelib/Table");
	}
}

package org.sonar.ux.checks.factory.check_impl.table.selection;

import java.util.List;
import java.util.stream.Collectors;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.ArgumentListTree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.ExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.NewExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.PairPropertyTree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.selection.SelectionCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class SelectionCheckImplV3 extends SelectionCheck 
{
	private boolean hasCheckBoxes = true;
	private boolean hasSingle = true;
	private boolean hasMultiple = true;
	private ArgumentListTree dependencies = null;
	private ArgumentListTree selectionArgs = null;
	private Tree checkboxTree, singleTree, multiTree;
	
	@Override
	public void visitScript(ScriptTree tree)
	{ 
		if(qualityExpected(tree))
		{
			getDependencies(tree);
			
			if(hasDependency(dependencies))
			{	
				getSelectionArgs(tree);
				
				if(!(qualityPresent(selectionArgs)))
				{
					if(!(hasCheckBoxes))
					{
						addIssue(checkboxTree, getCheckMessages()[0]);
					}
					
					if(!(hasSingle))
					{
						addIssue(singleTree, getCheckMessages()[1]);
					}
					
					if(!(hasMultiple))
					{
						addIssue(multiTree, getCheckMessages()[2]);
					}
				}
			}	
			
			else
			{
				addIssue(dependencies.arguments().get(0), getCheckMessages()[3]);
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

	private void getDependencies(Tree tree)
	{
		if(tree != null)
		{
			try
			{
				List<Tree> children = tree.childrenStream().collect(Collectors.toList());
			
				for(Tree child : children)
				{
					if(child instanceof CallExpressionTree && ((CallExpressionTree)child).callee().toString().equals("define"))
					{
						dependencies = ((CallExpressionTree)child).argumentClause();
					}
					
					getDependencies(child);
				}
			}
			
			catch(UnsupportedOperationException e)
			{
				
			}
		}
	}
	
	private boolean hasDependency(ArgumentListTree tree)
	{
		String [] dependencies = StringUtility.trimSplit(tree.arguments().get(0).toString(), ",");
		
		return 	ArrayUtility.arrayContainsValue(dependencies, "'tablelib/plugins/VirtualSelection'") || 
				ArrayUtility.arrayContainsValue(dependencies, "'tablelib/plugins/Selection'");
	}
	
	private void getSelectionArgs(Tree tree)
	{
		if(tree != null)
		{
			try
			{
				List<Tree> children = tree.childrenStream().collect(Collectors.toList());
			
				childLoop:
				for(Tree child : children)
				{
					if(child instanceof NewExpressionTree)
					{
						ExpressionTree classname = ((NewExpressionTree)child).expression();
						if(classname.toString().equals("VirtualSelection") || classname.toString().equals("Selection"))
						{
							selectionArgs = ((NewExpressionTree)child).argumentClause();
							
							//Find each selection type's tree
							List<Tree> args = selectionArgs.arguments().get(0).childrenStream().filter(c -> c instanceof PairPropertyTree).collect(Collectors.toList());
							for(Tree arg : args)
							{
								if(arg.toString().startsWith("checkboxes"))
								{
									checkboxTree = arg;
								}
								
								else if(arg.toString().startsWith("selectableRows"))
								{
									singleTree = arg;
								}
								
								else if(arg.toString().startsWith("multiselect"))
								{
									multiTree = arg;
								}
							}
							
							if(checkboxTree == null)
							{
								checkboxTree = selectionArgs;
							}
							
							if(singleTree == null)
							{
								singleTree = selectionArgs;
							}
							
							if(multiTree == null)
							{
								multiTree = selectionArgs;
							}
							
							break childLoop;
						}
					}
					
					getSelectionArgs(child);
				}
			}
			
			catch(UnsupportedOperationException e)
			{
				
			}
		}
	}
	
	@Override
	public boolean qualityPresent(Tree tree) 
	{
		boolean hasQuality = true;
		
		//need to find the specific constructor
		
		hasMultiple = treeHasProperty(multiTree, "multiselect : true");
		hasQuality = hasMultiple;
		
		hasSingle = treeHasProperty(singleTree, "selectableRows : true");
		hasQuality = hasQuality && hasSingle;

		hasCheckBoxes = treeHasProperty(checkboxTree, "checkboxes : true");
		hasQuality = hasQuality && hasCheckBoxes;
		
		return hasQuality;
	}
	
	private boolean treeHasProperty(Tree tree, String property)
	{
		return tree.toString().trim().equals(property);
	}
}

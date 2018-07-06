package org.sonar.ux.checks.factory.check_impl.table.settings;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.CallExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.NewExpressionTree;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.PinnedColumnsCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.ArrayUtility;
import utilities.StringUtility;

public class PinnedColumnsCheckImplV2 extends PinnedColumnsCheck 
{
	private CallExpressionTree define;
	private Tree issuePoint;
	private int issueType;
	
	@Override
	public void visitScript(ScriptTree tree)
	{
		if(qualityExpected(tree))
		{
			getDefineMethod(tree);
			
			if(!(qualityPresent(define)))
			{
				addIssue(issuePoint, getCheckMessages()[issueType]);
			}
		}
		
		super.visitScript(tree);
	}	
	
	@Override
	public boolean qualityExpected(Tree tree) 
	{
		boolean expected = false;
		
		//need to check both for table and table settings, will do all that in here, then check for depenedency in 
		Check tableCheck = UXCheckFactory.getInstance(TableCheck.class);
		List<Issue> tableIssues = tableCheck.scanFile(this.getContext());
		
		if(!(tableIssues.isEmpty()))
		{
			if(((PreciseIssue)tableIssues.get(0)).primaryLocation().message().equals(tableCheck.getCheckMessages()[2]))
			{		
				expected = true;
			}
		}
		
		//it is a table, check for settings
		if(expected)
		{
			Check settingsCheck = UXCheckFactory.getInstance(TableSettingsCheck.class);
			List<Issue> settingsIssues = settingsCheck.scanFile(this.getContext());
			expected = settingsIssues.isEmpty();
		}
		
		return expected;
	}

	
	private void getDefineMethod(Tree tree)
	{
		if(tree instanceof CallExpressionTree && ((CallExpressionTree)tree).callee().toString().equals("define"))
		{
			define =  (CallExpressionTree)tree;
		}
		
		else if(tree != null)
		{
			try
			{
				List<Tree> children = tree.childrenStream().collect(Collectors.toList());
				
				for(Tree child : children)
				{
					getDefineMethod(child);
				}
			}
			
			catch(UnsupportedOperationException e)
			{
				//Some Trees cannot produce a childrenStream, leaving this empty indicates it's the end of the branch of the AST
			}
		}
		
	}	
	
	@Override
	public boolean qualityPresent(Tree tree) 
	{
		boolean present = false;
		//Check for dependencies and constructors
		issuePoint = ((CallExpressionTree)tree).argumentClause().arguments().get(0);
		String [] dependencies = StringUtility.trimSplit(issuePoint.toString(), ",");
		present = ArrayUtility.arrayContainsValue(dependencies, "'tablelib/plugins/PinColumns'");
		
		if(present)
		{
			List<Tree> constructors = getConstructors(((CallExpressionTree)tree).argumentClause().arguments().get(1));
			
			present = !(constructors.isEmpty());
			
			if(!present)
				issueType = 0;
		}
		
		else
		{
			issueType = 1;
		}
			
		return present;
	}
	
	//Recursively get all NewExpressionTree type trees in the AST
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
					List<Tree> children = tree.childrenStream().collect(Collectors.toList());
					for(Tree child : children)
						list.addAll(getConstructors(child));
				}
				
				catch(UnsupportedOperationException e)
				{
					
				}
			}
		}
		
		return list;
	}
}

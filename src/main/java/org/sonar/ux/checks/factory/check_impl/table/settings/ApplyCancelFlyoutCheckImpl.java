package org.sonar.ux.checks.factory.check_impl.table.settings;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.ApplyCancelFlyoutCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import utilities.StringUtility;

public class ApplyCancelFlyoutCheckImpl extends ApplyCancelFlyoutCheck 
{
	private boolean hasApply = true;
	private boolean hasCancel = true;
	
	@Override
	public void visitScript(ScriptTree tree)
	{
		if(qualityExpected(tree) && !(qualityPresent(tree)))
		{
			if(!(hasApply))
			{
				addIssue(tree, getCheckMessages()[0]);
			}
			
			if(!(hasCancel))
			{
				addIssue(tree, getCheckMessages()[1]);
			}
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
		
		return table && (UXCheckFactory.getInstance(TableSettingsCheck.class)).scanFile(this.getContext()).isEmpty();
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		boolean hasQuality = true;
		String script = ((ScriptTree)tree).toString();
		
		hasApply = usingApply(script);
		hasQuality = hasApply;
		
		hasCancel = usingCancel(script);
		hasQuality = hasQuality && hasCancel;
		
		return hasQuality;
	}
	
	private boolean usingApply(String script)
	{
		String [] expectedTerms = {"getApply ( )", "this . apply", "'apply'"};
		
		return StringUtility.reverseSearch(script, expectedTerms);
	}
	
	private boolean usingCancel(String script)
	{
		String [] expectedTerms = {"getCancel ( )", "this . cancel", "'cancel'"};
		
		return StringUtility.reverseSearch(script, expectedTerms);
	}
}

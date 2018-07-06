package org.sonar.ux.checks.factory.check_impl.table.settings;

import java.util.List;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.visitors.Issue;
import org.sonar.plugins.javascript.api.visitors.PreciseIssue;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.MandatoryColumnsCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;

public class MandatoryColumnsCheckImpl extends MandatoryColumnsCheck 
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
		
		return table && (UXCheckFactory.getInstance(TableSettingsCheck.class)).scanFile(this.getContext()).isEmpty();
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		String script = tree.toString();

		String [] statements = script.split(";");

		boolean haveQuality = false;
		for(int statementIndex = 0; !haveQuality && statementIndex < statements.length; statementIndex++)
		{
			haveQuality = statements[statementIndex].contains("disableVisible : true");
		}
		
		return haveQuality;
	}
}

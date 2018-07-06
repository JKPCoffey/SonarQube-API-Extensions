package org.sonar.ux.checks.factory.check_impl.file.blank;

import org.sonar.plugins.javascript.api.tree.ScriptTree;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.ux.checks.file.BlankFileCheck;

public class BlankFileCheckImpl extends BlankFileCheck 
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
		//This should check any file it's given
		return true;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		return !(tree.toString().trim().equals("null null"));
	}
}

package org.sonar.ux.checks;

import org.sonar.check.Priority;
import org.sonar.check.Rule;
import org.sonar.plugins.javascript.api.tree.Tree;

import data.checks.Check;

@Rule
(
	key = "dum",
	name = "Filler check",
	description = "Filler",
	priority = Priority.INFO,
	tags = {"convention"}
)

/**
 * Placeholder non-primary UXCheck which provides the relational database with a default value.
 * @author Jack Coffey
 */
public class DummyCheck extends Check 
{

	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {};
	}

	@Override
	public boolean qualityExpected(Tree tree) 
	{
		return false;
	}

	@Override
	public boolean qualityPresent(Tree tree) 
	{
		return false;
	}

	@Override
	public boolean isPrimary() 
	{
		return false;
	}

}

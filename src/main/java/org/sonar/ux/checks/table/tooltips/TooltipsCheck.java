package org.sonar.ux.checks.table.tooltips;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "tool",
	priority = Priority.MINOR,
	name = "Check for Tooltips.",
	tags = {"ux"},
	description = "Data must have a tooltips."	
)
/**
 * UXCheck to identify the use of mouse-over tooltips.
 * This primary check is used directly by SonarQube.
 * @author Jack Coffey
 */
public abstract class TooltipsCheck extends Check
{
	private static final String NO_TOOLTIPS = "Data must have tooltips";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {NO_TOOLTIPS};		
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

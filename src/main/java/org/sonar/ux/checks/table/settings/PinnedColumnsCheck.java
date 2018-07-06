package org.sonar.ux.checks.table.settings;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "pin",
	priority = Priority.INFO,
	name = "Check for Pinnable Columns",
	tags = {"ux"},
	description = "Should be able to pin columns."	
)
/**
 * UXCheck to check for fixed column orderings.
 * This primary check is used directly by SonarQube.
 * @author Jack Coffey
 */
public abstract class PinnedColumnsCheck extends Check
{
	private static final String NO_PINNED_COLUMNS = "Tables must have pinnable columns";
	private static final String NO_DEPENDENCY = "The PinColumns dependency must be present";
	
	@Override
	public String[] getCheckMessages()
	{
		return new String[] {NO_PINNED_COLUMNS, NO_DEPENDENCY};
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

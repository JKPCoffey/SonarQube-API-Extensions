package org.sonar.ux.checks.table.columns;

import org.sonar.check.Rule;
import data.checks.Check;

import org.sonar.check.Priority;

@Rule
(
	key = "res",
	name = "Check for Resizable Columns",
	description = "Columns should be resizable",
	priority = Priority.MINOR,
	tags = {"ux"}
)
/**
 * UXCheck to determine whether or not a Table is using resizable headers.<p>
 * This check is primary, it is used directly by the Rules definition and by SonarQube.
 * @author Jack Coffey
 */
public abstract class ResizableColumnsCheck extends Check
{
	private static final String NO_RESIZABLE_COLUMNS = "Column headers must be resizable.";

	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {NO_RESIZABLE_COLUMNS};
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

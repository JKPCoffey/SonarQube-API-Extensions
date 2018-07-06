package org.sonar.ux.checks.table.settings;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "mand",
	priority = Priority.INFO,
	name = "Check for Mandatory Columns",
	tags = {"ux"},
	description = "Should have at least one mandatory column."	
)
/**
 * UXCheck to check for columns which cannot be hidden.<p>
 * This primary check is used directly by SonarQube.
 * @author Jack Coffey
 */
public abstract class MandatoryColumnsCheck extends Check
{
	private static final String NO_MANDATORY_COLUMNS = "Mandatory Columns must be used.";
	
	@Override
	public String[] getCheckMessages()
	{
		return new String[] {NO_MANDATORY_COLUMNS};
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

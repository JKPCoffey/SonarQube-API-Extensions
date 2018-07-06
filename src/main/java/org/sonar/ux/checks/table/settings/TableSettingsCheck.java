package org.sonar.ux.checks.table.settings;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "set",
	priority = Priority.MINOR,
	name = "Check for Table Settings",
	tags = {"ux"},
	description = 	"All Tables must use table settings.<br>The UI SDK provides this functionality for you.<br>"
			+ 		"The sdk dependency is expected at the top of the file<br><br>"
			+		"<h1>Compliant Example</h1>"
			+ 		"<code>define([...'tablelib/TableSettings'...]</code>"
)

/**
 * UXCheck for the use of a Table Settings button and functionality.
 * This primary check is used directly by SonarQube.
 * @author Jack Coffey
 */
public abstract class TableSettingsCheck extends Check
{

	private static final String NO_SETTINGS = "Table settings must be used";
	
	@Override
	public String[] getCheckMessages()
	{
		return new String[] {NO_SETTINGS};
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

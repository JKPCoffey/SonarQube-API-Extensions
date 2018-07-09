package org.sonar.ux.checks.table.settings;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "apca",
	priority = Priority.INFO,
	name = "Check for Apply and Cancel buttons in a table settings flyout",
	tags = {"ux"},
	description = "Apply and/or cancel button(s) should be used."
) 
/**
 * UXCheck for the usage of the Apply and Cancel buttons on the Table Settings dynamic frame.<p>
 * This primary check is used directly by SonarQube.
 * @author Jack Coffey
 */
public abstract class ApplyCancelFlyoutCheck extends Check
{
	private static final String NO_APPLY  = "Apply button must be used";
	private static final String NO_CANCEL = "Cancel button must be used";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {NO_APPLY, NO_CANCEL};
	}

	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

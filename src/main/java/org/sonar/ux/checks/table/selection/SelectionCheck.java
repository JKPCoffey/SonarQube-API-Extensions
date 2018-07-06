package org.sonar.ux.checks.table.selection;

import org.sonar.check.Priority;
import org.sonar.check.Rule;

import data.checks.Check;

@Rule
(
	key = "sel",
	name = "Check for Selection",
	tags = {"ux"},
	description = 	"Often when the selection types are used, they are set to some variable value."
				+	"This is wrong, there is never a reason for these properties to not be true, so a constant 'true' should be used instead"
				+	"<br><h1>Non-Compliant Example</h1>"
				+ 	"<code>checkboxes: false<br> selectableRows: this.selection<br> multiselect: CONST_TRUE</code><br><br>"
				+ 	"<br><h1>Compliant Example</h1>"
				+ 	"<code>checkboxes: true<br>selectableRows: true<br>multiselect: true</code>",
	priority = Priority.MINOR
)
/**
 * UXCheck to determine which styles of selection a Table is using.<p>
 * A Table can select in one or more of 3 ways:<p>
 * <b>1: Single Row Selection</b><p>where the user can select rows individually.
 * <b>2: Multiple Row Selection</b><p>where the user can select multiple rows at the same time.
 * <b>3: Checkbox Selection</b><p>where the user can select one or more specific row(s) by clicking checkboxes.<p><p>
 * This check is primary, it is used directly by the rules and SonarQube.
 * @author ezcofja
 */
public abstract class SelectionCheck extends Check
{
	private static final String NO_CHECKBOXES 	= "Checkboxes must be set to true.";
	private static final String NO_SINGLE 		= "SelectableRows must be set to true.";
	private static final String NO_MULTIPLE 	= "Multiselect must be set to true.";
	private static final String NO_DEPENDENCY	= "Tables must have a Selection plugin dependency.";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {NO_CHECKBOXES, NO_SINGLE, NO_MULTIPLE, NO_DEPENDENCY};
	}
	
	@Override
	public boolean isPrimary()
	{
		return true;
	}
}

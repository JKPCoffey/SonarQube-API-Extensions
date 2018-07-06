package org.sonar.ux.checks.table.columns;

import data.checks.Check;

/**
 * UXCheck to determine if the "Resizable Columns" are determined in a defining array literal within the javascript file.<p>
 * This check is non-primary and is used exclusively by the "ResizableColumnsCheck" class.
 * @author Jack Coffey
 */
public abstract class ArrayLiteralResizeCheck extends Check
{
	private static final String NOT_USED = "Resizable not used in array literal";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {NOT_USED};
	}
	
	@Override
	public boolean isPrimary()
	{
		return false;
	}
}

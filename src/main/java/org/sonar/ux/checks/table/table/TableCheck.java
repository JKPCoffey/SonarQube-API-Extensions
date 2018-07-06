package org.sonar.ux.checks.table.table;

import data.checks.Check;

/**
 * UXCheck to check for the use of the Table library.
 * This check is not primary, and it is used by all Table domain checks.
 * @author Jack Coffey
 */
public abstract class TableCheck extends Check
{
	private static final String NO_TABLE_DEPENDENCY = "Need a dependency on tablelib/Table";
	private static final String NOT_A_TABLE = "Not a table file";
	private static final String IS_A_TABLE = "It is a table";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[]{NO_TABLE_DEPENDENCY, NOT_A_TABLE, IS_A_TABLE};
	}
	
	@Override
	public boolean isPrimary()
	{
		return false;
	}
}

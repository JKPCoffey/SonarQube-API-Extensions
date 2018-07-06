package org.sonar.ux.checks.file;

import data.checks.Check;

/**
 * UXCheck to determine if a file is blank or empty.<p>
 * This Check is non-primary and is used only by other classes.<p>
 * Without this check, blank files would be flagged by flase-positives.
 * @author Jack Coffey
 */
public abstract class BlankFileCheck extends Check
{
	private static final String EMPTY_FILE = "The file is empty";
	
	@Override
	public String[] getCheckMessages() 
	{
		return new String[] {EMPTY_FILE};
	}
	
	@Override
	public boolean isPrimary()
	{
		return false;
	}
}

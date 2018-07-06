package org.sonar.plugin.definitions;

/**
 * An interface to define simple methods for the standard definition of a check in use by the plugin class.
 * @author Jack Coffey
 */
public interface CheckDefinition 
{
	/**
	 * The domain of a check refers to the general area of concern the check is focused on.
	 * @return A String representing the Domain of the check.
	 */
	public abstract String getDomain();
	
	/**
	 * The Subdomain of a check refers to a more specific area of concern than the Domain.
	 * @return A String representing the Subdomain of the check.
	 */
	public abstract String getSubdomain();
}

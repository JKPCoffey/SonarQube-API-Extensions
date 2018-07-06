package org.sonar.plugin.definitions;

import java.util.List;

import org.sonar.plugins.javascript.api.CustomJavaScriptRulesDefinition;

import data.checks.Check;
import data.checks.ChecksArchive;

/**
 * The abstract class at the base of every RuleDefinition for this SonarQube plugin.
 * @author Jack Coffey
 */
public abstract class UXCustomRulesDefinition extends CustomJavaScriptRulesDefinition implements CheckDefinition
{
	protected String domain; 
	protected String subdomain;

	/**
	 * Method used by the plugin class to determine which Check classes are in use for this rule definition.
	 * @return An array of Class objects of classes in use by this check.
	 */
	@Override
	public Class<?>[] checkClasses() 
	{
		List<Check> checks = ChecksArchive.getPrimaryChecks(domain, subdomain);
		Class<?>[] classes = new Class<?>[checks.size()];

		for(int index = 0; index < classes.length; index++)
		{
			classes[index] = checks.get(index).getClass();
		}
		
		return classes;
	}

	public String getDomain()
	{
		return domain;
	}
	
	public String getSubdomain()
	{
		return subdomain;
	}
}

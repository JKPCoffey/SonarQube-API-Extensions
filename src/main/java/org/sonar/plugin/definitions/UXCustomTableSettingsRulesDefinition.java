package org.sonar.plugin.definitions;

public class UXCustomTableSettingsRulesDefinition extends UXCustomRulesDefinition 
{
	public UXCustomTableSettingsRulesDefinition(String domain, String subdomain)
	{
		this.domain 	= domain;
		this.subdomain 	= subdomain;
	}
	
	//Create the name for the repository. Make it distinct and self-explanatory. Doesn't have too much of an affect
	@Override
	public String repositoryName() 
	{
		return "Custom ux Table Settings SonarQube Rules Example";
	}

	//Same as above, distinct and memorable.
	@Override
	public String repositoryKey() 
	{
		return "UX";
	}
}

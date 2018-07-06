package org.sonar.plugin.definitions;

public class UXCustomTableSelectionRulesDefinition extends UXCustomRulesDefinition 
{	
	public UXCustomTableSelectionRulesDefinition(String domain, String subdomain)
	{
		this.domain 	= domain;
		this.subdomain 	= subdomain;
	}
	
	@Override
	public String repositoryKey() 
	{
		return "UX";
	}

	@Override
	public String repositoryName() 
	{
		return "Custom UX Table Row Selection SonarQube Rules Example";
	}
}

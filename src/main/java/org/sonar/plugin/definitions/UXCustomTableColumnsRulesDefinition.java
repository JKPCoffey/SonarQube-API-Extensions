package org.sonar.plugin.definitions;

public class UXCustomTableColumnsRulesDefinition extends UXCustomRulesDefinition 
{
	public UXCustomTableColumnsRulesDefinition(String domain, String subdomain)
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
		return "Custom UX Table Resizable Column SonarQube Rules Example";
	}
}

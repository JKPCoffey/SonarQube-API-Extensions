package org.sonar.plugin.definitions;

public class UXCustomTableTooltipsRulesDefinition extends UXCustomRulesDefinition 
{
	public UXCustomTableTooltipsRulesDefinition(String domain, String subdomain)
	{
		this.domain 	= domain;
		this.subdomain 	= subdomain;
	}
	
	@Override
	public String repositoryKey() 
	{
		return "Custom UX Tooltips SonarQube Rules Example";
	}

	@Override
	public String repositoryName() 
	{
		return "UX";
	}
}

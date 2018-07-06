package org.sonar.plugin.definitions;

import org.sonar.ux.checks.DummyCheck;

class EmptyRuleDefinition extends UXCustomRulesDefinition 
{
	//Parameters are intentionally not used for the sake of ubiquity and generisism of the code
	public EmptyRuleDefinition(String domain, String subdomain)
	{
		this.domain = "NOTHING";
		this.subdomain = "NOTHING";
	}
	
	@Override
	public String repositoryName() 
	{
		return "EMPTY";
	}

	@Override
	public String repositoryKey() 
	{
		return "EMPTY";
	}
	
	@Override
	public Class<?>[] checkClasses() 
	{
		return new Class<?>[] {DummyCheck.class};
	}

}

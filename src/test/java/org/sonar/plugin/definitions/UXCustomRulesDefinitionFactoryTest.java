package org.sonar.plugin.definitions;

import static org.junit.Assert.*;

import java.io.Writer;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import data.logging.TestLogger;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

public class UXCustomRulesDefinitionFactoryTest 
{
	private TestLogger logger;
	
	@Before
	public void init()
	{
		logger = new TestLogger(getClass());
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void allTableDefintionsTest()
	{
		int expectedDefCount = 4;
		int actualDefCount = 0;
		
		String domain = "table";
		
		String [] subdomains = ((CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.SUBDOMAIN_DOMAIN)).getKeys(domain);
		
		try(Writer writer = logger.getMethodLogger("allTableDefinitions"))
		{
			for(String subdomain : subdomains)
			{
				UXCustomRulesDefinition ruleDef = UXCustomRulesDefinitionFactory.getInstance(domain, subdomain);
				
				if(!(ruleDef.getDomain().equals("NOTHING")))
				{
					assertEquals(domain, ruleDef.getDomain());
					assertEquals(subdomain, ruleDef.getSubdomain());
						
					writer.append("\t" + ruleDef.repositoryName() + "\n");
					actualDefCount++;
				}
			}
		}
		
		catch(Exception e)
		{
			Assert.fail("FAIL");
		}
		
		assertEquals(expectedDefCount, actualDefCount);
	}
}

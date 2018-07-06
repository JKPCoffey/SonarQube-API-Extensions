package data.domain;

import java.io.IOException;
import java.io.Writer;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import data.logging.TestLogger;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

public class CheckSubdomainRelationTest 
{
	private TestLogger logger;
	
	@Before
	public void init()
	{
		logger = new TestLogger(getClass());
	}
	
	@Test
	public void findAndSearchTest() 
	{
		try(Writer writer = logger.getMethodLogger("findAndSearchTest"))
		{
			@SuppressWarnings("unchecked")
			CheckRelation<String, String> relation = (CheckRelation<String, String>) CheckRelationFactory.getRelation(CheckRelationFactory.CHECK_SUBDOMAIN);
			
			String check = relation.getValue("TableCheck");
			writer.append("\t" + check + "\n");
			
			String[] searchResults = relation.getKeys(check);
			
			for(String result : searchResults)
			{
				writer.append("\t\t" + result);
			}
		} 
		catch (IOException e) 
		{
			Assert.fail("Failed to use logger.");
		}
	}
}

package data.domain;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import data.checks.Check;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

public class ImplementationCheckRelationTest 
{
	
	@SuppressWarnings("unchecked")
	@Test
	public void searchTest() 
	{
		CheckRelation<Check, String> implRelation = (CheckRelation<Check, String>) CheckRelationFactory.getRelation(CheckRelationFactory.IMPL_CHECK);
		
		Check [] checks = implRelation.getKeys("TableCheck");
		assertEquals("TableCheckImplV3", checks[0].getClass().getSimpleName());
	}
}

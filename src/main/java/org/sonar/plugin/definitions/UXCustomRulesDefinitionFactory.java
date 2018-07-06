package org.sonar.plugin.definitions;

import java.lang.reflect.InvocationTargetException;

import data.checks.Check;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

/**
 * Factory class for the UXCustomRulesDefinition type.
 * @author Jack Coffey
 */
public abstract class UXCustomRulesDefinitionFactory
{
	private UXCustomRulesDefinitionFactory()
	{
		//Page left intentionally blank
		//to prevent instantiation
	}
	
	/**
	 * Factory method for UXCustomRulesDefinition objects. 
	 * @param domain String representing a UXCheck Domain e.g Table.
	 * @param subdomain String representing a UXCheck Subdomain e.g Settings.
	 * @return a UXCustomRulesDefinition for the given Domain and Subdomain.
	 * @throws InstantiationException Via Java.Reflection.
	 * @throws IllegalAccessException Via Java.Reflection.
	 * @throws InvocationTargetException Via Java.Reflection.
	 * @throws NoSuchMethodException Via Java.Reflection.
	 * @throws ClassNotFoundException Via Java.Reflection.
	 */
	@SuppressWarnings("unchecked")
	public static UXCustomRulesDefinition getInstance(String domain, String subdomain) throws 	InstantiationException, IllegalAccessException, 
																								InvocationTargetException, NoSuchMethodException, 
																								ClassNotFoundException
	{
		Class<? extends UXCustomRulesDefinition> rulesClass;
		
		if(subdomainIsPrimary(subdomain))
		{
			String className = String.format("org.sonar.plugin.definitions.UXCustom%s%sRulesDefinition", capitalise(domain), capitalise(subdomain));
			rulesClass = (Class<? extends UXCustomRulesDefinition>) Class.forName(className);	
		}
		
		else
		{
			rulesClass = EmptyRuleDefinition.class;
		}
		
		return rulesClass.getConstructor(String.class, String.class).newInstance(domain, subdomain);
	}
	
	@SuppressWarnings("unchecked")
	private static boolean subdomainIsPrimary(String subdomain)
	{
		boolean primary = false;
		
		CheckRelation<String, String> subCheck = (CheckRelation<String, String>) CheckRelationFactory.getRelation(CheckRelationFactory.CHECK_SUBDOMAIN);
		CheckRelation<Check, String> checkImpl = (CheckRelation<Check, String>) CheckRelationFactory.getRelation(CheckRelationFactory.IMPL_CHECK);
		
		String [] checks = subCheck.getKeys(subdomain);
		
		for(int checkIndex = 0; !primary && checkIndex < checks.length; checkIndex++)
		{
			//There is a 1-1 relationship between checks and implementations, i.e each check has 1 implementation
			Check [] impl = checkImpl.getKeys(checks[checkIndex]);
			primary = impl[0].isPrimary();
		}
		
		return primary;
	}
	
	private static String capitalise(String word)
	{
		char [] letters = word.toCharArray();
		int firstLetter = (int)letters[0];
		letters[0] = (char)(firstLetter - 32);
		
		return new String(letters);
	}
}

package org.sonar.plugin;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;

import org.sonar.api.Plugin;
import org.sonar.plugin.definitions.UXCustomRulesDefinition;
import org.sonar.plugin.definitions.UXCustomRulesDefinitionFactory;

import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

/**
 * Plugin class for SonarQube.
 * @author Jack Coffey
 */
public class UXCustomRulesPlugin implements Plugin 
{
	private static final String [] DOMAINS = {"table"};
	
	/**
	 * Method defined in the Plugin superclass to list every RuleDefinition in use by the plugin.
	 */
	@Override
	public void define(Context context) 
	{
		List<UXCustomRulesDefinition> definitions = new ArrayList<>(0);
		
		for(String domain : DOMAINS)
		{
			@SuppressWarnings("unchecked")
			String [] subdomains = ((CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.SUBDOMAIN_DOMAIN)).getKeys(domain);
			
			for(String subdomain : subdomains)
			{
				try 
				{
					definitions.add(UXCustomRulesDefinitionFactory.getInstance(domain, subdomain));
				} 
				
				catch 	
				(	
					InstantiationException 		| IllegalAccessException 	| IllegalArgumentException |
					InvocationTargetException 	| NoSuchMethodException 	| SecurityException |
					NullPointerException 		| ClassNotFoundException e
				) 
				{
					//do nothing, let it pass
				}
			}
		}
		
		context.addExtensions
		(
			definitions
		);
	}

}

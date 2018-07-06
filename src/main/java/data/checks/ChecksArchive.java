package data.checks;

import java.util.ArrayList;
import java.util.List;

import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

/**
 * An abstract class with static methods for accessing checks in the database.<p>
 * Checks are categorised by Domain and Subdomain, essentially which topics they govern.<p>
 * Table would be an example of a Domain for all table rules. Settings would be an example of a Subdomain of rules, under the Table Domain.
 * @author Jack Coffey
 */
public abstract class ChecksArchive 
{
	private ChecksArchive()
	{
		//Page intentionally left blank to prevent instantiation. Even though this is an abstract class, Java provides an implicit default constructor.
	}
	
	/**
	 * A static method for retriving all Primary Checks of the provided Domain and Subdomain.
	 * @param domain A String representing a Domain of checks <p>
	 * e.g All checks relating to tables would be in the domain Table.
	 * @param subdomain A String representing a Subdomain of checks. A Subdomain is a domain within a Domain <p>
	 * e.g All the checks relating to table settings would be in the subdomain Settings and the domain Table.
	 * @return A List of only the Primary Checks relationally linked to the provided Domain and Subdomain.
	 */
	public static List<Check> getPrimaryChecks(String domain, String subdomain)
	{
		List<Check> allDomSubChecks = getChecks(domain, subdomain);
		List<Check> allDomSubPrimaries = new ArrayList<>(0);
		
		for(Check check : allDomSubChecks)
		{
			if(check.isPrimary())
			{
				allDomSubPrimaries.add(check);
			}
		}
		
		return allDomSubPrimaries;
	}
	
	@SuppressWarnings("unchecked")
	private static List<Check> getChecks(String domain, String subdomain) 
	{
		List<Check> results = new ArrayList<>(0);
		
		CheckRelation<String, String> subdomainDomainRel = (CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.SUBDOMAIN_DOMAIN);
		String[] subdomains = subdomainDomainRel.getKeys(domain);
		
		CheckRelation<String, String> checkSubdomainRel = (CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.CHECK_SUBDOMAIN);
		CheckRelation<Check, String> implCheckRel = (CheckRelation<Check, String>)CheckRelationFactory.getRelation(CheckRelationFactory.IMPL_CHECK);
		for(String subdom : subdomains)
		{
			if(subdom.equals(subdomain))
			{
				String [] checks = checkSubdomainRel.getKeys(subdomain);
				for(String check : checks)
				{
					Check [] impls = implCheckRel.getKeys(check);
					for(Check impl : impls)
						results.add(impl);
				}
			}
		}
		
		return results;
	}
}

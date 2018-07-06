package data.relation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import data.reader.RelationStreamAnalyser;
import data.reader.RelationStreamAnalyserFactory;

public class SubdomainDomainRelation implements CheckRelation<String, String>
{
	private static final String DOMAIN_FILE = "/data/domain/domains_and_subdomains.rel";
	private Map<String, String> relations;
	
	@SuppressWarnings("unchecked")
	public SubdomainDomainRelation()
	{
		relations = new HashMap<>();
		
		//Read in the data from a file, maybe this should be in Strings instead, for simplicity sake
		try 
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, DOMAIN_FILE);
			
			String [] subdomains = reader.getKeys();
			
			for(String subdomain : subdomains)
			{
				relations.put(subdomain, reader.getValue(subdomain));
			}
		} 
		
		catch(Exception e) 
		{
			e.printStackTrace();
		}
		
	}
	
	@Override
	public String getValue(String key) 
	{
		return relations.get(key);
	}

	@Override
	public String[] getKeys(String value) 
	{
		List<String> searchResults = new ArrayList<>(0);
		
		for(Map.Entry<String, String> entry : relations.entrySet())
		{
			if(entry.getValue().equals(value))
				searchResults.add(entry.getKey());
		}
		
		return searchResults.toArray(new String[0]);
	}
}

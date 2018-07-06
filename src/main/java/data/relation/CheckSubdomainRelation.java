package data.relation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import data.reader.RelationStreamAnalyser;
import data.reader.RelationStreamAnalyserFactory;

public class CheckSubdomainRelation implements CheckRelation<String, String> 
{
	private static final String SUBDOMAIN_FILE = "/data/domain/subdomains_and_checks.rel";
	private Map<String, String> relations;
	
	@SuppressWarnings("unchecked")
	public CheckSubdomainRelation()
	{
		relations = new HashMap<>();
		
		try 
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.SUBDOMAIN_CHECKS, SUBDOMAIN_FILE);

			String[] checks = reader.getKeys();
			
			for(String check : checks)
			{
				relations.put(check, reader.getValue(check));
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

package data.relation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import data.checks.Check;
import data.reader.RelationStreamAnalyser;
import data.reader.RelationStreamAnalyserFactory;

public class ImplementationCheckRelation implements CheckRelation<Check, String> 
{
	public static final String IMPL_FILE = "/data/domain/checks_and_implementations.rel";
	private Map<Check, String> relations;
	
	@SuppressWarnings("unchecked")
	public ImplementationCheckRelation()
	{
		relations = new HashMap<>();
		
		try 
		{
			RelationStreamAnalyser<Check, String> reader = 
			(RelationStreamAnalyser<Check, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.IMPL_CHECK, IMPL_FILE);
			
			Check[] classes = reader.getKeys();
			
			for(Check checkClass : classes)
			{
				relations.put(checkClass, reader.getValue(checkClass));
			}
		} 
		
		catch(Exception e) 
		{
			e.printStackTrace();
		}
	}

	@Override
	public String getValue(Check key) 
	{
		return relations.get(key);
	}

	@Override
	public Check[] getKeys(String value) 
	{
		List<Check> searchResults = new ArrayList<>(0);
		
		for(Map.Entry<Check, String> entry : relations.entrySet())
		{
			if(entry.getValue().equals(value))
				searchResults.add(entry.getKey());
		}
		
		return searchResults.toArray(new Check[0]);
	}
}

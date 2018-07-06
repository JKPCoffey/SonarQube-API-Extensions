package data.reader;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.InputStream;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import data.checks.Check;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;
import utilities.StringUtility;


class ImplementationCheckStreamAnalyser implements RelationStreamAnalyser<Check, String> 
{
	private static final String PATH_BEGINING = "org.sonar.ux.checks.factory.check_impl.";
	private InputStream stream;
	private Map<Check, String> map;
	
	public ImplementationCheckStreamAnalyser(InputStream stream) throws IOException
	{
		this.stream = stream;
		this.map = new HashMap<>();
		analyseStream();	
	}
	
	
	@SuppressWarnings("unchecked")
	@Override
	public void analyseStream() throws IOException 
	{
		try(BufferedReader reader = new BufferedReader(new InputStreamReader(stream)))
		{
			String line = "";
			String currentCheck = "";
			
			while((line = reader.readLine()) != null)
			{
				try
				{
					if(line.startsWith("c:"))
					{
						currentCheck = line.substring(2) + "Check";
					}
					
					else if(line.startsWith("i:"))
					{
						String subdomain = 
							((CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.CHECK_SUBDOMAIN)).getValue(currentCheck);
						
						String domain = 
							((CheckRelation<String, String>)CheckRelationFactory.getRelation(CheckRelationFactory.SUBDOMAIN_DOMAIN)).getValue(subdomain);
						
						String [] implementations = StringUtility.trimSplit(line.substring(2), ",");
						
						for(String implementation : implementations)
						{
							Class<?> implClass = Class.forName(PATH_BEGINING + domain + "." + subdomain + "." + implementation);
							Check checkImpl = (Check) implClass.getConstructor().newInstance();
							map.put(checkImpl, currentCheck);
						}
					}
				}
				
				catch(Exception e)
				{
					map.put(null, null);
				}
			}
		}
	}

	@Override
	public Check[] getKeys() 
	{
		List<Check> checks = new ArrayList<>(0);
		
		for(Map.Entry<Check, String> entry : map.entrySet())
		{
			checks.add(entry.getKey());
		}
		
		return checks.toArray(new Check[0]);
	}

	@Override
	public String getValue(Check key) 
	{
		return map.get(key);
	}

}

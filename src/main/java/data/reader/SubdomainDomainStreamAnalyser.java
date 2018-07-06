package data.reader;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.util.HashMap;
import java.util.Map;

import utilities.StringUtility;

class SubdomainDomainStreamAnalyser implements RelationStreamAnalyser<String, String>
{
	private InputStream stream;
	private Map<String, String> map;
	
	public SubdomainDomainStreamAnalyser(InputStream stream) throws IOException
	{
		this.stream = stream;
		map = new HashMap<>();
		analyseStream();	
	}
	
	public void analyseStream() throws IOException
	{
		//Try with resources to close BufferedReader
		try(BufferedReader reader = new BufferedReader(new InputStreamReader(stream)))
		{
			String line = "";
			String currentDomain = "";
			while((line = reader.readLine()) != null)
			{
				//Domain
				if(line.startsWith("d:"))
				{
					currentDomain = line.substring(2);
				}
				
				//Subdomain
				else if(line.startsWith("s:"))
				{
					String [] subdomains = StringUtility.trimSplit(line.substring(2), ",");
					
					for(String subdomain : subdomains)
					{
						map.put(subdomain, currentDomain);
					}
				}
			}
		}
	}
	
	//Get subdomains
	@Override
	public String[] getKeys() 
	{
		return map.keySet().toArray(new String[0]);
	}

	//Get a subdomain's domain
	@Override
	public String getValue(String key) 
	{
		return map.get(key);
	}
}

package data.reader;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import java.util.Map;
import java.util.Map.Entry;

import utilities.StringUtility;


class CheckSubdomainStreamAnalyser implements RelationStreamAnalyser<String, String>
{
	private InputStream stream;
	private Map<String, String> map;
	
	public CheckSubdomainStreamAnalyser(InputStream stream) throws IOException
	{
		this.stream = stream;
		this.map = new HashMap<>();
		analyseStream();
	}

	@Override
	public void analyseStream() throws IOException
	{
		try(BufferedReader reader = new BufferedReader(new InputStreamReader(stream)))
		{
			String line = "";
			String currentSubdomain = "";
			
			while((line = reader.readLine()) != null)
			{
				if(line.startsWith("s:"))
				{
					currentSubdomain = line.substring(2);
				}
				
				else if(line.startsWith("c:"))
				{
					String [] checks = StringUtility.trimSplit(line.substring(2), ",");
					
					for(String check : checks)
					{
						String className = check + "Check";
						
						map.put(className, currentSubdomain);
					}
				}
			}
		}
	}

	@Override
	public String[] getKeys() 
	{
		List<String> classObjects = new ArrayList<>(0);
		
		for(Entry<String, String> entry : map.entrySet())
		{
			classObjects.add(entry.getKey());
		}
		
		return classObjects.toArray(new String[0]);
	}

	@Override
	public String getValue(String key) 
	{
		return map.get(key);
	}

}

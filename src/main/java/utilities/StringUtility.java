package utilities;

/**
 * Utility class for commonly used String functionality.
 * @author Jack Coffey
 */
public class StringUtility 
{
	private StringUtility()
	{
		//Prevents accidental instantiation
	}
	
	/**
	 * Like the traditional splitting with the addition of removing leading and trailing whitespaces.
	 * @param string The source string for the splitting.
	 * @param delimeter The identifying string for splitting the string into an array.
	 * @return an array of Strings whose begining and ending whitespaces have been removed.
	 */
	public static String [] trimSplit(String string, String delimeter)
	{
		String [] results = string.split(delimeter);
		
		for(int index = 0; index < results.length; index++)
		{
			results[index] = results[index].trim();
		}
		
		return results;
	}
	
	/**
	 * Search through a given String for given key terms.
	 * @param searchSource String to search.
	 * @param searchTerms Terms to search for in source.
	 * @return True if source contains one or more of the terms.
	 */
	public static boolean reverseSearch(String searchSource, String [] searchTerms)
	{
		boolean found = false;
		
		if(searchSource.isEmpty())
		{
			if(arrayIsEmpty(searchTerms))
			{
				found = true;
			}
			
			else
			{
				found = false;
			}
		}
		
		else
		{
			if(!(arrayIsEmpty(searchTerms)))
			{
				for(int index = 0; !found && index < searchTerms.length; index++)
				{
					found = 	searchSource.contains(searchTerms[index]) 
							|| 	searchSource.contains(searchTerms[index].toLowerCase()) 
							|| 	searchSource.contains(searchTerms[index].toUpperCase());
				}
			}
		}
		
		return found;
	}
	
	private static boolean arrayIsEmpty(String [] array)
	{
		boolean empty = (array == null || array.length == 0);
		
		for(int index = 0; !empty && index < array.length; index++)
		{
			empty = array[index].isEmpty();
		}
		
		return empty;
	}
}

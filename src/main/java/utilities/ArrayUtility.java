package utilities;

import java.util.ArrayList;

/**
 * Utility class for commonly used Array functionality.
 * @author Jack Coffey
 */
public class ArrayUtility 
{
	private ArrayUtility()
	{
		//Prevents accidental instantiation of this class
	}
	
	/**
	 * Boolean check for if a given value is in a given array.
	 * @param array Array of values.
	 * @param value Value possibly in array.
	 * @return True if any element of the array is equal to the provided value.
	 */
	public static boolean arrayContainsValue(Object [] array, Object value)
	{
		boolean result = false;
		
		if(array != null && value != null)
		{
			for(int index = 0; index < array.length && !result;index++)
			{
				result = array[index].toString().equals(value.toString());
			}
		}
		
		return result;
	}
	
	/**
	 * Reduce an array by removing duplicate values.
	 * @param array Array of 0,1 or many duplicates.
	 * @return An array of equal or smaller length.
	 */
	public static Object[] minimiseArray(Object [] array)
	{
		ArrayList<Object> resultArrayList = new ArrayList<>(0);
		
		for(Object object : array)
		{
			if(!(resultArrayList.contains(object)))
			{
				resultArrayList.add(object);
			}
		}
		
		return resultArrayList.toArray();
	}
}

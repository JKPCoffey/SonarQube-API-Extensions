package utilities;

import static org.junit.Assert.*;

import utilities.ArrayUtility;
import org.junit.Test;

public class ArrayUtilityTest {

	@Test
	public void ArrayContainsValueTest() 
	{
		String [] array = {"value", "123"};
		String nullString = null;
		Number nullNumber = null;
		
		assertEquals(true, ArrayUtility.arrayContainsValue(array, "value"));
		
		assertEquals(false,ArrayUtility.arrayContainsValue(array, "val"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "1"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "2"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "3"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "12"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "23"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "13"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, nullString));
		assertEquals(false, ArrayUtility.arrayContainsValue(new String [] {}, "value"));
		assertEquals(false, ArrayUtility.arrayContainsValue(null, "value"));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, "VALUE"));
		
		assertEquals(true, ArrayUtility.arrayContainsValue(array, 123));
		
		assertEquals(false, ArrayUtility.arrayContainsValue(array, 1));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, 2));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, 3));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, 12));
		assertEquals(false, ArrayUtility.arrayContainsValue(array, 23));
		
		assertEquals(false, ArrayUtility.arrayContainsValue(array, nullNumber));
	}
	
	@Test
	public void minimiseArrayTest()
	{
		String [] array = {"1", "1", "1", "1", "1", "1", "1", "1", "1"};
		Object [] minimisedArray = ArrayUtility.minimiseArray(array);
		
		assertEquals(true, minimisedArray[0].equals("1"));
	}
}

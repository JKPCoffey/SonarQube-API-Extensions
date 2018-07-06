package utilities;

import static org.junit.Assert.*;

import org.junit.Test;

import utilities.StringUtility;

public class StringUtilityTest 
{
	@Test
	public void emptySourceReverseSearchTest()
	{
		String searchSource = "";
		String [] searchTerms = {"A", "B", "C"};
		
		assertFalse(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void emptyTermsReverseSearchTest()
	{
		String searchSource = "Full Text";
		String [] searchTerms = {};
		
		assertFalse(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void emptyReverseSearchTest()
	{
		String searchSource = "";
		String [] searchTerms = {};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void validReverseSearchTest()
	{
		String searchSource = "A B C";
		String [] searchTerms = {"A", "B", "C"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void invalidReverseSearchTest()
	{
		String searchSource = "A B C";
		String [] searchTerms = {"D", "E", "F"};
		
		assertFalse(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void partialSourceReverseSearchTest()
	{
		String searchSource = "A B";
		String [] searchTerms = {"A", "B", "C"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void partialTermsReverseSearchTest()
	{
		String searchSource = "A B C";
		String [] searchTerms = {"A", "B"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void caseSensitiveReverseSearchTest()
	{
		String searchSource = "A B C";
		String [] searchTerms = {"a", "b", "c"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void partialWordReverseSearchTest()
	{
		String searchSource = "Racecar";
		String [] searchTerms = {"Race", "Car"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void duplicateTermsTest()
	{
		String searchSource = "A B C";
		String [] searchTerms = {"A", "A", "A"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
	
	@Test
	public void partialDuplicateTermsTest()
	{
		String searchSource = "Racecar track";
		String [] searchTerms = {"Racecar", "car"};
		
		assertTrue(StringUtility.reverseSearch(searchSource, searchTerms));
	}
}

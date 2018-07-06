package org.sonar.ux.checks.table.table;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.CheckTester;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.table.TableCheck;

import data.checks.Check;
import data.logging.TestLogger;
import utilities.ExamplesFileFilter;

public class TableCheckTest 
{
	private static final Check check = UXCheckFactory.getInstance(TableCheck.class);
	
	private CheckTester tableTester = 
	(filename, issue) -> 	
	{	
		File file = new File(filename);
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		if(issue)
		{
			verifier.next();
			try
			{
				verifier
				.withMessage(check.getCheckMessages()[0]);
			}
			
			catch(AssertionError table)
			{
				try
				{
					verifier
					.withMessage(check.getCheckMessages()[1]);
				}
				
				catch(AssertionError isT)
				{
					verifier
					.withMessage(check.getCheckMessages()[2]);
				}
			}
		}
		
		else
		{
			verifier.noMore();
		}
	};
	
	
	private static final String RESOURCES_PATH = "./src/test/resources/";
	
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(TableCheckTest.class);
	}
	
	
	@Test
	public void testBase()
	{
		String  [] filenames = {RESOURCES_PATH + "checks/table/selection/notATableFile.js", RESOURCES_PATH + "checks/table/notATable.js", 
								RESOURCES_PATH + "checks/table/validTable.js", RESOURCES_PATH + "checks/table/invalidTable.js",
								RESOURCES_PATH + "bulk-config/regions/createjoberror/CreateJobError.js"};
		boolean [] eachIssue = {true, false, true, true, true};
		
		for(int test = 0; test < filenames.length; test++)
		{
			tableTester.test(filenames[test], eachIssue[test]);
		}
	}
	
	@Test
	public void selectionResourcesTest()
	{
		String filename 	= RESOURCES_PATH + "checks/table/selection/notATableFile.js";
		boolean hasIssue 	= true;
		
		tableTester.test(filename, hasIssue);
	}
	
	@Test
	public void notATableTest() 
	{
		String filename 	= RESOURCES_PATH + "checks/table/notATable.js";
		boolean hasIssue 	= false;
		
		tableTester.test(filename, hasIssue);
	}
	
	@Test
	public void isAValidTableTest()
	{
		String filename 	= RESOURCES_PATH + "checks/table/validTable.js";
		boolean hasIssue 	= true;
		
		tableTester.test(filename, hasIssue);
	}
	
	@Test
	public void isAnInvalidTableTest()
	{
		String filename 	= RESOURCES_PATH + "checks/table/invalidTable.js";
		boolean hasIssue	= true;
		
		tableTester.test(filename, hasIssue);
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withTables 	= new ArrayList<String>(0);
		ArrayList<String> withoutTables = new ArrayList<String>(0);
		
		File examplesFolder = new File(RESOURCES_PATH + "table-examples/");
		File [] exampleFiles = examplesFolder.listFiles(new ExamplesFileFilter());
		
		for(File example : exampleFiles)
		{
			String exampleTableFilename = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCES_PATH + "table-examples/" + exampleTableFilename);
			
			CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, exampleTable);
			
			try
			{
				verifier.next()
				.withMessage(check.getCheckMessages()[0]);
				withoutTables.add(example.getName());
			}
			
			catch(AssertionError table)
			{
				withTables.add(example.getName());
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWithout Tables:\n");
			for(String without : withoutTables)
			{
				writer.append("\t\t" + without + "\n");
			}
			
			writer.append("\n\tWith Tables:\n");
			for(String with : withTables)
			{
				writer.append("\t\t" + with + "\n");
			}
		}
		
		catch(IOException io)
		{
			Assert.fail("Failed to use logger.");
		}
		
	}
}

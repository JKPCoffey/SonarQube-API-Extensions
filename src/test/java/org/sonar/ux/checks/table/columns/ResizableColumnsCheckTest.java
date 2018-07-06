package org.sonar.ux.checks.table.columns;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.factory.UXCheckFactory;

import data.checks.Check;
import data.logging.TestLogger;
import utilities.ExamplesFileFilter;

public class ResizableColumnsCheckTest 
{
	private Check resCheck = UXCheckFactory.getInstance(ResizableColumnsCheck.class);
	
	private static final String RESOURCES_PATH 	= "./src/test/resources/";
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(ResizableColumnsCheckTest.class);
	}
	
	@Test
	public void notATableFileTest() 
	{
		File file = new File(RESOURCES_PATH + "checks/table/columns/notATableFile.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(resCheck, file);
		verifier.noMore();
	}
	
	@Test
	public void quickFilterTableTest()
	{
		File file = new File(RESOURCES_PATH + "/table-examples/quick-filter-table/src/quick-filter-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(resCheck, file);
		verifier.noMore();
	}
	
	@Test
	public void simpleTableTest() throws IOException
	{
		File file = new File(RESOURCES_PATH + "/table-examples/simple-table/src/simple-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(resCheck, file);
		verifier.next()
		.withMessage(resCheck.getCheckMessages()[0])
		.noMore();
	
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withResizable 	= new ArrayList<>(0);
		ArrayList<String> withoutResizable 	= new ArrayList<>(0);
		
		File examplesFolder = new File(RESOURCES_PATH + "/table-examples/");
		File [] examples = examplesFolder.listFiles(new ExamplesFileFilter());
		
		for(File example : examples)
		{
			String tablePath = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCES_PATH + "/table-examples/" + tablePath);
			try
			{
				JavaScriptCheckVerifier.issues(resCheck, exampleTable).next().withMessage(resCheck.getCheckMessages()[0]);
				withoutResizable.add(example.getName());
			}
			
			catch(AssertionError resize)
			{
				withResizable.add(example.getName());
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWith Resizable Columns:\n");
			for(String with : withResizable)
			{
				writer.append("\t\t" + with + "\n");
			}
			
			writer.append("\n\n");
			
			writer.append("\tWithout Resizable Columns:\n");
			for(String without : withoutResizable)
			{
				writer.append("\t\t" + without + "\n");
			}
		}
		catch(IOException io)
		{
			Assert.fail("Failed to use logger.");
		}
	}
	
	@Test
	public void resizableHeaderExampleTest()
	{
		File file = new File(RESOURCES_PATH + "/table-examples/resizable-columns-table/src/resizable-columns-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(resCheck, file);
		verifier.noMore();
	}
}

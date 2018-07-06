package org.sonar.ux.checks.table.tooltips;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import utilities.ExamplesFileFilter;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.factory.UXCheckFactory;

import data.checks.Check;
import data.logging.TestLogger;

public class TooltipsCheckTest 
{
	private static final String RESOURCE_PATH = "./src/test/resources/";
	
	private Check check = UXCheckFactory.getInstance(TooltipsCheck.class);
	
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(TooltipsCheckTest.class);
	}
	
	@Test
	public void notATableFileTest() 
	{
		File file = new File(RESOURCE_PATH + "checks/table/tooltips/notATableFile.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		verifier.noMore();
	}
	
	@Test
	public void simpleTableExampleTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/simple-table/src/simple-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		verifier.next()
		.withMessage(check.getCheckMessages()[0]);
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withTooltips 		= new ArrayList<>(0);
		ArrayList<String> withoutTooltips 	= new ArrayList<>(0);
		
		File exampleFolder = new File(RESOURCE_PATH + "table-examples");
		File [] examples = exampleFolder.listFiles(new ExamplesFileFilter());
		
		for(File example : examples)
		{
			String filepath = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCE_PATH + "table-examples/" + filepath);
			
			try
			{
				JavaScriptCheckVerifier.issues(check, exampleTable).next().withMessage(check.getCheckMessages()[0]);
				withoutTooltips.add(example.getName());
			}
			
			catch(AssertionError tooltip)
			{
				withTooltips.add(example.getName());
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWith Tooltips:\n");
			for(String with : withTooltips)
			{
				writer.append("\t\t" + with + "\n");
			}
			
			writer.append("\n\tWithout Tooltips:\n");
			for(String without : withoutTooltips)
			{
				writer.append("\t\t" + without + "\n");
			}
		}
		
		catch(IOException io)
		{
			Assert.fail("Faile to use logger.");
		}
	}
}

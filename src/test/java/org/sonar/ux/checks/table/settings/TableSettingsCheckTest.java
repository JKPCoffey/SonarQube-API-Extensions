package org.sonar.ux.checks.table.settings;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import utilities.ExamplesFileFilter;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;

import data.checks.Check;
import data.logging.TestLogger;

import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;

public class TableSettingsCheckTest
{
	private Check setCheck = UXCheckFactory.getInstance(TableSettingsCheck.class);
	
	private static final String RESOURCE_PATH = "src/test/resources/";
	
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(TableSettingsCheckTest.class);
	}
	
	@Test
	public void validFileTest() 
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/requireDefineChecks/validTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier.next()
		.withMessage(setCheck.getCheckMessages()[0]);
	}
	
	@Test
	public void invalidFileTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/requireDefineChecks/invalidTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier.next()
		.withMessage(setCheck.getCheckMessages()[0]);
	}
	
	@Test
	public void blankFileTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/notATable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		
		verifier.noMore();
	}
	
	@Test
	public void userTableFileTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/simple-table-settings/src/simple-table-settings/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier.noMore();
	}
	
	@Test
	public void resizeableColumnsExampleTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/resizable-columns-table/src/resizable-columns-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier.next()
		.withMessage(setCheck.getCheckMessages()[0])
		.noMore();
	}
	
	@Test
	public void createJobErrorTest()
	{
		File file = new File(RESOURCE_PATH + "bulk-config/regions/createjoberror/CreateJobError.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier
		.noMore();
	}
	
	@Test
	public void TableSettingsTableTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/tableSettingsCheck/TableSettingsTable.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, file);
		verifier
		.next()
		.withMessage(setCheck.getCheckMessages()[0])
		.noMore();
	}
	
	@Test
	public void allExamplesTest()
	{
		File examplesFolder = new File(RESOURCE_PATH + "table-examples/");
		
		File [] examples = examplesFolder.listFiles(new ExamplesFileFilter());
		
		ArrayList<String> withSettings 		= new ArrayList<>(0);
		ArrayList<String> withoutSettings 	= new ArrayList<>(0);
		
		for(File example : examples)
		{
			String fileSuffix = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCE_PATH + "table-examples/" + fileSuffix);
			CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(setCheck, exampleTable);
			
			try
			{
				verifier.next().withMessage(setCheck.getCheckMessages()[0]);
				withoutSettings.add(example.getName());
			}
			
			catch(AssertionError e)
			{
				withSettings.add(example.getName());
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWith Table Settings:\n");
			for(String with : withSettings)
			{
				writer.append("\t\t" + with + "\n");
			}
			

			writer.append("\n\tWithout Table Settings:\n");
			for(String without : withoutSettings)
			{
				writer.append("\t\t" + without + "\n");
			}
		}
		
		catch(IOException io)
		{
			Assert.fail("Failed to use logger.");
		}
	}
}

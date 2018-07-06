package org.sonar.ux.checks.table.settings;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import utilities.ExamplesFileFilter;

import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.ux.checks.factory.UXCheckFactory;
import org.sonar.ux.checks.table.settings.PinnedColumnsCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;

import data.checks.Check;
import data.logging.TestLogger;
import junit.framework.Assert;

import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;

public class PinnedColumnsTest
{
	private Check pinCheck = UXCheckFactory.getInstance(PinnedColumnsCheck.class);
	private Check setCheck = UXCheckFactory.getInstance(TableSettingsCheck.class);
	
	private static final String RESOURCES_PATH = "./src/test/resources/";
	
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(PinnedColumnsTest.class);
	}
	
	@Test
	public void pinnedColumnExampleTest() 
	{
		File file = new File(RESOURCES_PATH + "table-examples/pinned-column-table/src/pinned-column-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(pinCheck, file);
		verifier.noMore();
	}
	
	@Test
	public void notATableTest()
	{
		File file = new File(RESOURCES_PATH + "checks/table/settings/pinnedColumnsChecks/notATableFile.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(pinCheck, file);
		verifier.noMore();
	}
	
	@Test
	public void simpleTableSettingsExampleTest()
	{
		File file = new File(RESOURCES_PATH + "table-examples/simple-table-settings/src/simple-table-settings/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(pinCheck, file);
		verifier.next()
		.withMessage(pinCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withoutSettings 	= new ArrayList<>(0);
		ArrayList<String> withoutPinned 	= new ArrayList<>(0);
		ArrayList<String> withPinned 		= new ArrayList<>(0);
		
		
		File examplesFolder = new File(RESOURCES_PATH + "table-examples/");
		File [] examples = examplesFolder.listFiles(new ExamplesFileFilter());
		
		for(File example : examples)
		{
			String filePath = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCES_PATH + "table-examples/" + filePath);
			
			try
			{
				JavaScriptCheckVerifier.issues(setCheck, exampleTable)
				.next()
				.withMessage(setCheck.getCheckMessages()[0]);
				withoutSettings.add(example.getName());
			}
			
			catch(AssertionError table)
			{
				try
				{
					JavaScriptCheckVerifier.issues(pinCheck, exampleTable)
					.next()
					.withMessage(pinCheck.getCheckMessages()[0]);
					withoutPinned.add(example.getName());
				}
				
				catch(AssertionError pinned)
				{
					withPinned.add(example.getName());
				}
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWithout Table Settings:\n");
			for(String without : withoutSettings)
			{
				writer.append("\t\t" + without + "\n");
			}
			
			writer.append("\n\n");
			
			
			writer.append("\tWith Pinned Columns:\n");
			for(String with : withPinned)
			{
				writer.append("\t\t" + with + "\n");
			}
			
			writer.append("\n\n");
			
			
			writer.append("\tWithout Pinned Columns:\n");
			for(String with : withoutPinned)
			{
				writer.append("\t\t" + with + "\n");
			}
		} 
		catch (IOException e) 
		{
			Assert.fail("Failed to use logger.");
		}
	}
	
	@Test
	public void netexCreateJobErrorFalslyFlagged()
	{
		File file = new File("C:/Users/ezcofja/Desktop/Projects/networkExplorer/NetworkExplorerLib/NetworkExplorerLib/src/networkexplorerlib/classes/CollectionErrorHandler.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(pinCheck, file);
		
		verifier.noMore();
	}
}

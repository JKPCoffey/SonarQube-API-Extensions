package org.sonar.ux.checks.table.settings;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import utilities.ExamplesFileFilter;

import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.ux.checks.factory.UXCheckFactory;

import org.sonar.ux.checks.table.settings.MandatoryColumnsCheck;
import org.sonar.ux.checks.table.settings.TableSettingsCheck;

import data.checks.Check;
import data.logging.TestLogger;
import junit.framework.Assert;

import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;

import org.sonar.squidbridge.checks.CheckMessagesVerifier;

public class MandatoryColumnsCheckTest
{
	private Check manCheck = UXCheckFactory.getInstance(MandatoryColumnsCheck.class);
	private Check setCheck = UXCheckFactory.getInstance(TableSettingsCheck.class);
	
	private static final String RESOURCE_PATH = "./src/test/resources/";
	
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(MandatoryColumnsCheckTest.class);
	}
	
	@Test
	public void notATableTest() 
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/mandatoryColumnsChecks/notATable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(manCheck, file);
		
		verifier.noMore();
	}
	
	@Test
	public void pinnedColumnTableTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/pinned-column-table/src/pinned-column-table/widgets/user-table/UserTable.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(manCheck, file);
	
		verifier.noMore();
	}
	
	@Test
	public void noncompliantTableTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/settings/flyoutChecks/TableWithoutFlyout.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(manCheck, file);
	
		verifier.next()
		.withMessage(manCheck.getCheckMessages()[0])
		.noMore();
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withoutSettings 			= new ArrayList<>(0);
		
		ArrayList<String> withMandatoryColumns 		= new ArrayList<>(0);
		ArrayList<String> withoutMandatoryColumns 	= new ArrayList<>(0);
		
		File folder = new File(RESOURCE_PATH + "table-examples/");
		File [] tableFiles = folder.listFiles(new ExamplesFileFilter());
		
		for(File example : tableFiles)
		{
			String filePath = String.format("%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(RESOURCE_PATH + "table-examples/" + filePath);
			
			try
			{
				CheckMessagesVerifier tableSettingsVerifier = JavaScriptCheckVerifier.issues(setCheck, exampleTable);
				tableSettingsVerifier.next()
				.withMessage(setCheck.getCheckMessages()[0])
				.noMore();
				
				withoutSettings.add(example.getName());
			}
			
			catch(AssertionError tableSettings)
			{
				try
				{
					CheckMessagesVerifier mandatoryColumnsVerifier = JavaScriptCheckVerifier.issues(manCheck, exampleTable);
					mandatoryColumnsVerifier.next()
					.withMessage(manCheck.getCheckMessages()[0])
					.noMore();
					
					withoutMandatoryColumns.add(example.getName());
				}
				
				catch(AssertionError mandatoryColumns)
				{
					withMandatoryColumns.add(example.getName());
				}
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWithout Settings:\n");
			for(String without : withoutSettings)
			{
				writer.append("\t\t" + without + "\n");
			}
			
			writer.append("\n\n");
			
			
			writer.append("\tWith Mandatory Columns:\n");
			for(String with : withMandatoryColumns)
			{
				writer.append("\t" + with + "\n");
			}
			
			writer.append("\n\n");
			
			writer.append("\tWithout Mandatory Columns:\n");
			for(String without : withoutMandatoryColumns)
			{
				writer.append("\t\t" + without + "\n");
			}
		} 
		catch (IOException e) 
		{
			Assert.fail("Failed to use logger.");
		}
	}
}

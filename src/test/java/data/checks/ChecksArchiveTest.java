package data.checks;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.io.Writer;

import java.util.List;

import org.junit.Test;

import data.logging.TestLogger;

public class ChecksArchiveTest 
{
	@Test
	public void getDomainSubdomainPrimaryChecks()
	{
		TestLogger logger = new TestLogger(getClass());
		
		try(Writer writer = logger.getMethodLogger("getDomainSubdomainPrimaryChecks"))
		{
			writer.append("\tPrimary Checks for Columns:\n");
			
			List<Check> columnsPrimaries = ChecksArchive.getPrimaryChecks("table", "columns");
			for(Check colCheck : columnsPrimaries)
			{
				writer.append("\t\t" + colCheck.getClass().getSuperclass().getSimpleName() + "\n");
			}
		
		
			assertEquals(1, columnsPrimaries.size());
		
			writer.append("\n\tPrimary Checks for Settings:\n");
			
			List<Check> settingsPrimaries = ChecksArchive.getPrimaryChecks("table", "settings");
			for(Check setCheck : settingsPrimaries)
			{
				writer.append("\t\t" + setCheck.getClass().getSuperclass().getSimpleName() + "\n");
			}
			
			assertEquals(4, settingsPrimaries.size());
		} 
		
		catch (IOException e) 
		{
			fail();
		}
	}
}

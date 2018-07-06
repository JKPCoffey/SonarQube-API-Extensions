package data.relation;

/**
 * An interface defining basic methods for a relation in use in this plugin.
 * @author Jack Coffey
 * @param <C> Type representing the keys.
 * @param <T> Type representing the values.
 */
public interface CheckRelation<C, T>
{
	/**
	 * C type keys and T type values are relationallly linked to eachother. By providing a key, it is possible to retrive a value.
	 * @param key A key relationally linked to a T type value.
	 * @return A value linked to the provided key.
	 */
	public abstract T getValue(C key);
	
	/**
	 * C type keys and T type values are relationallly linked to eachother. By providing a value, it is possible to retrieve an array of keys.
	 * @param value A T type value.
	 * @return An Array of C type objects relationally linked to the provided T type value.
	 */
	public abstract C[] getKeys(T value);
}
